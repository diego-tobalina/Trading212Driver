import {Request, Response} from 'express'

const validateToken = (req: Request, res: Response, next) => {
    const configToken = process.env.TOKEN;

    // validación del token
    const bodyToken = req.body['token'];
    if (bodyToken != configToken) {
        res.json({status: 'invalid token'})
        return;
    }
    next();
}

export default validateToken
