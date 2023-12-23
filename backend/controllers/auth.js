const mongoose = require('mongoose');
const cryptoRandomString = require('crypto-random-string');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const { use } = require('../routes/users.js');
require('dotenv').config();


// const isValidId = (id) => {
//     mongoose.Types.ObjectId.isValid(id);
// };

const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

const checkPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
}

const generateToken = (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn });
}

const handleError = (res, status, message) => {
    return res.status(status).json({ error: message });
}

const handleSuccess = (res, status, data) => {
    return res.status(status).json(data);
}

const isValidPassword = (password) => {
    return validator.isLength(password, { min: 8}) && validator.matches(password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/);
}

const isValidUser = (user) => {
    return validator.isLength(user, { min: 3, max: 20 }) && validator.matches(user, /^[a-zA-Z0-9_]+$/);
}

const isValidEmail = (email) => {
    return validator.isEmail(email);
}

const sendEmail = async (service, email, password, fromEmail, toEmail, message, subject) => {
    try {
        const transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user: email,
                pass: password
            }
        });

        const mailOptions = {
            from: fromEmail,
            to: toEmail,
            subject: subject,
            html: message,
        };
        
        await transporter.sendMail(mailOptions);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

exports.login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password; 

    try {
        const user = await User.findOne({username: username});
        const isValidPassword = await checkPassword(password, user.password);

        if (!user || !isValidPassword) {
            return handleError(res, 404, 'Invalid username or password.');
        }

        user.loginHistory.push(Date.now());

        const accessToken = generateToken({username: username, _id: user._id}, process.env.ACCESS_TOKEN_SECRET, '15m');
        const refreshToken = generateToken({username: username, _id: user._id}, process.env.REFRESH_TOKEN_SECRET, '7d');

        user.refreshToken = refreshToken;
        await user.save();

        const expirationTime = new Date().getTime() + 15 * 60 * 1000;

        return handleSuccess(res, 200, {accessToken: accessToken, refreshToken: refreshToken, expiresIn: expirationTime, message: 'Authentication successful.'});
    } catch(error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}

exports.logOut = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const user = await User.findOne({refreshToken: refreshToken});

        if (!user) {
            return handleError(res, 404, 'User not found.');
        }

        user.refreshToken = undefined;
        user.
        await user.save();

        res.clearCookie('refreshToken');
        return handleSuccess(res, 200, {message: 'User logged out successfully.'});
    } catch (error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}

exports.authenticate = async (req, res) => {
    try {
        const accessToken = req.body.accessToken;
        const refreshToken = req.body.refreshToken;

        if (!accessToken && !refreshToken) {
            return handleError(res, 401, 'Access token and refresh token not provided.');
        }

        if (accessToken) {
            const userPayload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findOne({ _id: userPayload._id });

            if (!user) {
                return handleError(res, 404, 'User not found.');
            }

            // if action exists in body, check if user has permission to perform action

            if (req.body.action) {
                const userPermissions = user.sitePermissions;
                const action = req.body.action;

                if (!userPermissions.includes(action)) {
                    return handleError(res, 403, 'User does not have permission to perform this action.');
                }
            }

            return handleSuccess(res, 200, {message: 'User authenticated successfully.'});
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return handleError(res, 401, 'Access token expired.');
            } else {
                return handleError(res, 500, 'Internal Server Error');
            }
        }
    }
}   


exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
    
        if (!refreshToken) {
            return handleError(res, 401, 'Refresh token not provided.');
        }

        const userPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({ _id: userPayload._id });

        if (!user) {
            return handleError(res, 404, 'User not found.');
        }

        const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
        const expirationTime = new Date().getTime() + 15 * 60 * 1000;

        return handleSuccess(res, 200, {accessToken: accessToken, refreshToken: refreshToken, expiresIn: expirationTime, message: 'Token refreshed successfully.'});

    } catch (error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}

exports.registerUser = async (req, res) => {
    try {
        const email = req.body.email.trim();
        const username = req.body.username.trim();
        const password = req.body.password.trim();

        const user = User.findOne({username: username});
        if(user) {
            return handleError(res, 400, 'Username already in use.');
        }

        user = User.findOne({email: email});
        if(user) {
            return handleError(res, 400, 'Email already in use.');
        }

        
        if (!isValidEmail(email)) {
            return handleError(res, 400, 'Invalid email format.');
        }

        if (!isValidUser(username)) {
            return handleError(res, 400, 'Invalid username format.');
        }

        if (!isValidPassword(password)) {
            return handleError(res, 400, 'Invalid password format.');
        }

        const verificationToken = cryptoRandomString({length: 20});
        
        const newUser = new User ({
            username: username,
            email: email,
            password: await hashPassword(password),
            name: req.body.name,
            birthday: req.body.birthday,
            securityQuestions: req.body.securityQuestions,
            verificationToken: verificationToken,
            isVerified: false,
        });

        const savedUser = await newUser.save();
        const userToReturn = {
            username: savedUser.username,
            email: savedUser.email,
            name: savedUser.name,
            birthday: savedUser.birthday,
            about: savedUser.about,
            socialMedia: savedUser.socialMedia,
            website: savedUser.website,
            sitePermissions: savedUser.role,
        };

        const subject = 'Verify your email address';
        const verifyEmailMessage = `
            <div style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 5px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #24292e; font-size: 24px; font-weight: bold; border-bottom: 1px solid #e1e4e8; padding-bottom: 20px;">Welcome to Brown Box Studio!</h1>
                    <p style="color: #586069; font-size: 18px;">To verify your email address, please click the button below:</p>
                    <a href="${process.env.BASE_URL}/verify-email?token=${verificationToken} style="margin: 0 auto; display: inline-block; background-color: #0366d6; color: white; text-decoration: none; padding: 15px 25px; margin: 20px 0; cursor: pointer; border-radius: 5px; font-size: 18px;">Verify Email</a>
                    <p style="color: #586069; font-size: 18px;">If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 20px 0;">
                    <p style="color: #586069; font-size: 12px; font-style: italic;">This is an automated message, please do not reply.</p>
                    <div style="margin-top: 30px; padding: 15px; background-color: #f6f8fa; border-radius: 5px; border: 1px solid #e1e4e8;">
                        <h2 style="color: #24292e; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Need Help?</h2>
                        <p style="color: #586069; font-size: 16px;">If you're having trouble clicking the "Verify Email" button, copy and paste the URL below into your web browser:</p>
                        <p style="color: #0366d6; font-size: 16px;">${process.env.BASE_URL}/verify-email?token=${verificationToken} </p>
                    </div>
                </div>
            </div>
        `;

        if (sendEmail(process.env.EMAIL_SERVICE, process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD, `"Do Not Reply" <${process.env.NO_REPLY_EMAIL}>`, newUser.email, verifyEmailMessage, subject )) { 
            return handleSuccess(res, 201, { user:userToReturn, message: 'User verification sent successfully.'});
        } else {
            return handleError(res, 500, 'Error sending email.');
        }
    } catch (error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const _id = req.params._id;
        const user = User.findOne({_id: _id});
        
        if (!user) {
            return handleError(res, 404, 'User not found.');
        }

        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        if(oldPassword != use.password) {
            return handleError(res, 400, 'Incorrect password.');
        }

        if(confirmPassword !== newPassword) {
            return handleError(res, 400, 'Passwords do not match.');
        }

        const isValidPassword = await checkPassword(req.body.oldPassword, user.password);

        if (!isValidPassword) {
            //invalid password error
            return handleError(res, 400, 'Incorrect password.');
        }


        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();
        return handleSuccess(res, 200, {message: 'Password updated successfully.'});
    } catch (error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}

exports.verifyEmail = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        
        if(!verificationToken) {
            return handleError(res, 400, 'Verification token not provided.');
        }

        const user = await User.findOne({verificationToken: verificationToken});

        if (!user) {
            return handleError(res, 404, 'User not found.');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return handleSuccess(res, 200, {message: 'Email verified successfully.'});
    } catch (error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}

exports.forgotPassword = async (req, res) => {
    
    try {
        const email = req.body.email;
        const username = req.body.username;
        
        if (!email && !username) {
            return handleError(res, 400, 'Email or username not provided.');
        }

        if (email || username) {
            const user = await User.findOne({email: email, username: username});

            if (!user) {
                return handleError(res, 404, 'User not found.');
            }

            const resetToken = cryptoRandomString({length: 20});

            user.resetToken = resetToken;
            await user.save();

            const subject = 'Reset your password';
            const resetPasswordMessage = `
                <div style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 5px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #24292e; font-size: 24px; font-weight: bold; border-bottom: 1px solid #e1e4e8; padding-bottom: 20px;">Password Reset Request</h1>
                        <p style="color: #586069; font-size: 18px;">To reset your password, please click the button below:</p>
                        <a href="${process.env.BASE_URL}/reset-password?token=${resetPasswordToken}" style="margin: 0 auto; display: inline-block; background-color: #0366d6; color: white; text-decoration: none; padding: 15px 25px; margin: 20px 0; cursor: pointer; border-radius: 5px; font-size: 18px;">Reset Password</a>
                        <p style="color: #586069; font-size: 18px;">If you did not request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 20px 0;">
                        <p style="color: #586069; font-size: 12px; font-style: italic;">This is an automated message, please do not reply.</p>
                        <div style="margin-top: 30px; padding: 15px; background-color: #f6f8fa; border-radius: 5px; border: 1px solid #e1e4e8;">
                            <h2 style="color: #24292e; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Need Help?</h2>
                            <p style="color: #586069; font-size: 16px;">If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:</p>
                            <p style="color: #0366d6; font-size: 16px;">${process.env.BASE_URL}/reset-password?token=${resetPasswordToken}</p>
                        </div>
                    </div>
                </div>
            `;

            const emailSent = sendEmail(process.env.EMAIL_SERVICE, process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD, `"Do Not Reply" <${process.env.NO_REPLY_EMAIL}>`, user.email, resetPasswordMessage, 'Reset your password');

            if (emailSent) { 
                return handleSuccess(res, 200, {message: 'Password reset email sent successfully.'});
            } else {
                return handleError(res, 500, 'Error sending email.');
            }
        }
    } catch (error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const resetToken = req.query.token;
        const newPassword = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        const user = await User.findOne({resetToken: resetToken});
        
        if (!user) {
            return handleError(res, 404, 'User not found.');
        }

        if (newPassword !== confirmPassword) {
            return handleError(res, 400, 'Passwords do not match.');
        }

        if (!isValidPassword(newPassword)) {
            return handleError(res, 400, 'Invalid password format.');
        }


        user.password = await hashPassword(newPassword);
        user.resetToken = undefined;
        await user.save();

        return handleSuccess(res, 200, {message: 'Password reset successfully.'});
    } catch (error) {
        return handleError(res, 500, 'Internal Server Error');
    }
}