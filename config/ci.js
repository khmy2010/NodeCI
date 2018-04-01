module.exports = {
    googleClientID: process.env.googleClientID,
    googleClientSecret: process.env.googleClientSecret,
    mongoURI: process.env.mongoURI,
    cookieKey: process.env.cookieKey,
    redisUrl: process.env.redisUrl
};

//travis encrypt googleClientID="381928868316-2spb3hkum1o845hv1mbc36cpju05pv5o.apps.googleusercontent.com" --add
//travis encrypt googleClientSecret="Znwn_rxhuGi0Dox58NVyZPl9" --add
//travis encrypt mongoURI="mongodb://localhost:27017/Blogster-CI" --add
//travis encrypt cookieKey="123123" --add
//travis encrypt redisUrl="redis://127.0.0.1:6379" --add
