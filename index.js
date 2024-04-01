require("dotenv").config();
const express = require("express")
const cors = require("cors")
const bodyParser = require('body-parser')
const Therapy_Session = require("./models/therapy")
const ARIMA = require("arima");
const User = require("./models/user")
const forgot_pw = require("./models/forgot_password");
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express()
app.use(bodyParser.json());

app.use(cors())

function generateUniqueToken() {
    return crypto.randomBytes(20).toString("hex");
}

const prompts = {
    "Correct independent production": 100,
    "Visual prompt": 80,
    "Verbal prompt": 60,
    "Tactile prompt": 40,
    "Hand under hand assistance": 20
}

// const arimaConfig = {
//     p: 2, 
//     d: 1, 
//     q: 1, 
//     verbose: false
// };

app.get("/api/arima", async (req, res) => {
    try {
        const { patient_id, p_value, d_value, q_value } = req.body;
        if (!patient_id) {
            return res.status(400).json("Missing patient_id parameter");
        }

        const findtherapy = await Therapy_Session.findAll({
            where: {
                patient_id: patient_id
            },
            attributes: ["prompt", "createdAt"]
        });

        // Prepare data for ARIMA
        const data = findtherapy.map(session => ({
            date: session.createdAt.toDateString(),
            prompt: prompts[session.prompt]
        }));

        // Group data by date and calculate the average
        const averagePrompts = {};
        const promptCounts = {};
        data.forEach(session => {
            const date = new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const promptValue = session.prompt;
            if (!averagePrompts[date]) {
                averagePrompts[date] = 0;
                promptCounts[date] = 0;
            }
            averagePrompts[date] += promptValue;
            promptCounts[date]++;
        });

        // Calculate average for each date and round off to whole numbers
        for (const date in averagePrompts) {
            averagePrompts[date] = Math.round(averagePrompts[date] / promptCounts[date]);
        }

        // Prepare data for ARIMA
        const values = Object.values(averagePrompts);

        const arimaConfig = {
            p: p_value,
            d: d_value,
            q: q_value,
            verbose: false
        };

        // Train ARIMA model
        const arimaModel = new ARIMA(arimaConfig);
        arimaModel.train(values);

        // Predict the next value
        const predictedValue = Math.round(arimaModel.predict(1)[0]);

        // Format response
        const response = {
            Prompts: averagePrompts,
            predicted_prompt: predictedValue
        };

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json("Internal server error");
    }
});


app.post("/user/forgot", async (req, res) => {
    const email = req.body.email;

    try {
        // Find the client by email
        const existingClient = await User.findOne({
            where: { email: email }
        });

        if (!existingClient) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Generate a unique token for password reset
        const resetToken = generateUniqueToken();

        await forgot_pw.create({
            email: email,
            token: resetToken
        })

        // Send password reset email
        const resetLink = `http://localhost/maneclick-v.2/frontend/resetpassword.php?token=${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "manetestacc123@gmail.com",
                pass: "qjzk vmaa rtnm ssfv",
            },
        });

        const mailOptions = {
            from: "manetestacc123@gmail.com",
            to: email,
            subject: "Password Reset Request",
            text: `Dear ${existingClient.firstname},\n\nYou have requested a password reset. Click the following link to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error(error);
                res.status(500).json({ message: "Error sending email" });
            } else {
                console.log("Password reset email sent: " + info.response);
                res.json({
                    message: "Password reset link sent to your email"
                });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/user/reset-password", async (req, res) => {
    const { resetToken, newPassword, confirmNewPassword } = req.body

    try {

        const findUser = await forgot_pw.findOne({
            where: {
                token: resetToken
            },
            attributes: ["email"]
        })

        if (!findUser) {
            return res.status(404).json({ message: "User not found" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Check if newPassword and confirmNewPassword match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        const [updatedRowCount] = await User.update(
            { password: hashedPassword },
            { where: { email: findUser.email } }
        );

        if (updatedRowCount === 0) {
            return res.status(404).json({ message: "Invalid or expired reset token" });
        }

        await forgot_pw.destroy({
            where: {
                token: resetToken
            }
        })

        res.status(200).json({
            message: "Password reset successful",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})