export const cookieExtractor = (req: any) => {
  if (req && req.cookies && req.cookies.token) {
    return req.cookies.token as string;
  }
  return null;
};
