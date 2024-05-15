export default {
  secret: process.env.SECRET_KEY,
  signOption: {
    expiresIn: 3600 * 24 * 15,
  },
};
