import passport from "passport";
import local from "passport-local";
import userDao from "../dao/mongoDB/user.dao.js";
import { createHash, isValidPassword } from "../utils/hashPassword.js";

const LocalStrategy = local.Strategy;

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