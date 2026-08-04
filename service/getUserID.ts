import { DecryptJWT } from "./jwt.service";

export function GetUserDetails(token : string){
    try{
        return DecryptJWT(token)
    }
    catch{
        return null
    }

}