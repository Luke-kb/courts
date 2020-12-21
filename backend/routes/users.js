const router = require('express').Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
let User = require('../models/user')

// admin route
router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(e => res.status(400).json('Error: ' + e))
})
// login user route 
router.route('/login').post((req, res, next) => {
    // console.log('hit login route')
    // console.log('data sent=', req.body)
    passport.authenticate("local", { failureRedirect: '/login'}, (error, user, info) => {
        try {
            if (error) {
                res.send({
                    success: false,
                    message: `Error: ${error}`
                })
            }
            if(!user) res.send({
                success: false,
                message: "Incorrect username/password"})
            else {
                req.login(user, error => {
                    if (error) {
                        res.send({
                            success: false,
                            message: `Error: ${error}`
                        })
                    }
                    res.send({
                        success: true,
                        message: 'user successfully authenticated'
                    })
                    console.log(req.user)
                })
            }
        } catch (error) {
            res.send({
                success: false,
                message: `Error: ${error}`
            })
        }
    })(req, res, next)
})


//     User.find({ username: req.body.username, password: req.body.password }, 
//         async (err, match) => {
//         try {
//             console.log('match=', match)
//             if (!match.length > 0) res.send("Invalid username/password")
//             if (match.length > 0) res.send("user matched")   
//             } catch (error) {
//                res.send(error)
//             }
//         })

// ----------------------------------------------------
// register user route 
router.route('/register').post((req, res, next) => {
    //testing
    console.log("hit register route")
    console.log('username = ' + req.body.username)
    
    // assign user credentials to variables 
    const {username} = req.body
    const {email} = req.body
    const userType = "player"
    const {password} = req.body 

    //validate form inputs
    if (!username) {
        return res.send({
            success: false,
            message: 'Error! Username cannot be blank'
        })
    }
    
    if (!email) {
        return res.send({
            success: false,
            message: 'Error! Email cannot be blank'
        })
    }
    
    if (!password) {
        return res.send({
            success: false,
            message: 'Error! Password cannot be blank'
        })
    }
    
    //verify that username doesn't already exist
    User.find({
        username: username
        }, async (error, existingUser) => {
            if (error) {
                return res.send({
                    success: false,
                    message: `Error: ${error}`
                })
            } else if (existingUser.length > 0) {
                return res.send({
                    success: false,
                    message: 'Error: Account already exists.'
                })
            }
        // create new user instance
        const newUser = new User()
        // set credentials to new user instance
        newUser.username = username
        newUser.email = email
        newUser.userType = userType
        newUser.password = await bcrypt.hash(password, 10)  //hash password
        // save new user 
        newUser.save((err, user) => {
            if (err) {
                return res.send({
                    success: false,
                    message: `Error: ${error}`
                })
            }
            return res.send({
                success: true,
                message: 'User is successfully registered.'
            })
        })
        console.log("finish")
    })
})

module.exports = router