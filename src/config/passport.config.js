import passport from "passport";
import local from "passport-local";
import google from "passport-google-oauth20";
import userDao from "../dao/mongoDB/user.dao.js";
import { createHash, isValidPassword } from "../utils/hashPassword.js";
import envs from "./envs.config.js";

const LocalStrategy = local.Strategy;
const GoogleStrategy = google.Strategy;

export const initializePassport = () => {
passport.use(
    "register",
    new LocalStrategy({ passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
        try {
            const { first_name, last_name, age } = req.body;
            const user = await userDao.getByEmail(username);
            if (user) return done(null, false, { message: "User already exists" });
        const newUser = {
            first_name,
            last_name,
            password: createHash(password),
            email: username,
            age,
        };
        const userCreate = await userDao.create(newUser);
        return done(null, userCreate);
            } catch (error) {
                return done(error);
            }
    })
);

passport.use(
    "login",
    new LocalStrategy({usernameField:"email"}, async (username, password, done) => {
        try {
            const user = await userDao.getByEmail(username);
            if (!user || !isValidPassword(user.password, password)) return done(null, false);
            return done(null, user);
        } catch (error) {
        done(error)
        }
    })
)

passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: envs.GOOGLE_CLIENT_ID,
            clientSecret: envs.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8080/api/session/google",
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const { name, emails } = profile;
                const user = await userDao.getByEmail(emails[0].value);
        if (user) {
            return cb(null, user);
        } else {
            const newUser = {
                first_name: name.givenName,
                last_name: name.familyName,
                email: emails[0].value,
            };

            const userCreate = await userDao.create(newUser);
            return cb(null, userCreate);
        }
        } catch (error) {
            return cb(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user._id); 
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userDao.getById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
};