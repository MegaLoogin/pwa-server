export class ApiError extends Error{
    status;
    errors;

    constructor(status, message, errors = []){
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError(){
        return new ApiError(401, "User not authtorized");
    }

    static BadRequest(message, errors = []){
        return new ApiError(400, message, errors);
    }
}

export default function(err, req, res, next){
    //console.log(err.message);
    if(err instanceof ApiError) return res.status(err.status).json({message: err.message, errors: err.errors});

    return res.status(500).json({message: "Unknown error"});
}