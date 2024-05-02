import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    username: {type: String, unique: true, requried: true},
    password: {type: String, requried: true}
});

export default model('User', UserSchema);