const express = require("express");
const app = express();

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

dotenv.config();
const PORT = process.env.PORT || 3000;

//database connect
database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  }),
);
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
//def route

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
