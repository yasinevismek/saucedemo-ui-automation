module.exports = Object.freeze({
  standardUser: Object.freeze({
    username: 'standard_user',
    password: 'secret_sauce',
  }),
  lockedUser: Object.freeze({
    username: 'locked_out_user',
    password: 'secret_sauce',
  }),
  invalidUsernameUser: Object.freeze({
    username: 'invalid_user',
    password: 'secret_sauce',
  }),
  invalidPasswordUser: Object.freeze({
    username: 'standard_user',
    password: 'invalid_password',
  }),
});
