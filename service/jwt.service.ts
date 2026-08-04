import jwt from "jsonwebtoken";


export function GenerateToken(payload: any) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET_KEY as string;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch {
    throw new Error("Failed to Generate Token");
  }
}

export function DecryptJWT(token: string) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET_KEY as string;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return decoded;
  } catch (e) {
    console.error("JWT VERIFY ERROR:", e);
    return null;
  }
}
