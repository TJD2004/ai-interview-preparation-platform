const { ResumeCheck } = require('../models');
const { extractResumeText } = require('../utils/resumeParser');
const { getGroqCompletion } = require('../utils/groq');

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume screener and career coach.
You will be given raw resume text and a target job role. Analyze how well the resume would perform
against an automated ATS scan and against a human recruiter for that specific role.

Respond with ONLY valid JSON, no markdown formatting, no code fences, no commentary outside the JSON.
Use exactly this shape:
{
  "atsScore": <integer 0-100, overall ATS-friendliness and role-fit score>,
  "matchedKeywords": [<important skills/keywords for the target role that ARE present in the resume>],
  "missingKeywords": [<important skills/keywords for the target role that are NOT present but commonly expected>],
  "formattingIssues": [<specific ATS-unfriendly issues you can infer from the text, e.g. missing sections, no quantified achievements, inconsistent dates, no clear contact info; keep to what you can reasonably infer from plain extracted text>],
  "suggestions": [<4-6 concrete, specific, actionable improvements>],
  "summary": "<2-3 sentence plain-language summary of overall resume quality for this role>"
}`;

function parseJSONFromModel(text) {
  let cleaned = text.trim();
  // strip markdown code fences if the model added them despite instructions
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // last resort: extract the first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Could not parse AI response as JSON');
  }
}

exports.check = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'A resume file is required' });
    const { targetRole } = req.body;
    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({ error: 'targetRole is required' });
    }

    const resumeText = await extractResumeText(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract readable text from this file. Try a different format.' });
    }

    const truncatedText = resumeText.slice(0, 8000);
    const userMessage = `Target role: ${targetRole}\n\nResume text:\n"""\n${truncatedText}\n"""`;

    const aiReply = await getGroqCompletion(SYSTEM_PROMPT, userMessage, { temperature: 0.3, maxTokens: 1000 });
    const parsed = parseJSONFromModel(aiReply);

    const record = await ResumeCheck.create({
      user: req.userId,
      targetRole: targetRole.trim(),
      fileName: req.file.originalname,
      atsScore: parsed.atsScore ?? null,
      matchedKeywords: parsed.matchedKeywords || [],
      missingKeywords: parsed.missingKeywords || [],
      formattingIssues: parsed.formattingIssues || [],
      suggestions: parsed.suggestions || [],
      summary: parsed.summary || ''
    });

    res.status(201).json({
      id: record.id,
      targetRole: record.targetRole,
      fileName: record.fileName,
      atsScore: parsed.atsScore,
      matchedKeywords: parsed.matchedKeywords || [],
      missingKeywords: parsed.missingKeywords || [],
      formattingIssues: parsed.formattingIssues || [],
      suggestions: parsed.suggestions || [],
      summary: parsed.summary || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not analyze resume', details: err.message });
  }
};

exports.history = async (req, res) => {
  const checks = await ResumeCheck.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .select('targetRole fileName atsScore createdAt');
  res.json({ checks });
};

exports.detail = async (req, res) => {
  try {
    const record = await ResumeCheck.findOne({ _id: req.params.id, user: req.userId });
    if (!record) return res.status(404).json({ error: 'Resume check not found' });

    res.json({
      id: record.id,
      targetRole: record.targetRole,
      fileName: record.fileName,
      atsScore: record.atsScore,
      matchedKeywords: record.matchedKeywords,
      missingKeywords: record.missingKeywords,
      formattingIssues: record.formattingIssues,
      suggestions: record.suggestions,
      summary: record.summary,
      createdAt: record.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Resume check not found' });
  }
};
