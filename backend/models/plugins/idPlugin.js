// Shared schema plugin: makes every model serialize like the old Sequelize
// rows did - an `id` string field, no `_id`/`__v` - so the frontend (which
// expects `session.id`, `user.id`, etc.) needs zero changes.
function idPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      delete ret._id;
      return ret;
    }
  });
  schema.set('toObject', { virtuals: true });
}

module.exports = idPlugin;
