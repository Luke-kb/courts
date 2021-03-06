const User = require("../models/user")
const bcrypt = require("bcryptjs")
const localStrategy = require("passport-local").Strategy

// define local strategy 
module.exports = function(passport) {
    
    // local strategy
    passport.use(
        new localStrategy((username, password, done) => {
            User.findOne({username: username}, (error, user) => {
                console.log("user found:", user)
                if (error) return done(error)
                if (!user || !user.verifyPasswordSync(password)) return done(null, false)
                bcrypt.compare(password, user.password, (error, result) => {
                    if (result === true) {
                        //return null as error and the user if password comparison is successful
                        return done(null, user, {message: "successful login!"})
                    } else if (result !== true) {
                        // return no user if comparison fails
                        return done(null, false, {message: "Incorrect username/password."})
                    } else {
                        // return error is server problem
                        return done(error)
                    }
                })
            })
        })
    )
    
    // stores a cookie with user id inside
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    // return user from the cookie
    passport.deserializeUser(async (id, done) => {
        try {
            await User.findOne({_id: id}, (err, user) => {
                done(err, user)
            })    
        } catch (error) {
            done(error)
        }
    })

}