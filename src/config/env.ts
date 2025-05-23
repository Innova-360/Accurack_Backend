export const GlobalConfig = () => ({
    AWS_REGION: process.env.AWS_REGION,
    USER_POOL_ID: process.env.USER_POOL_ID,
    USER_POOL_CLIENT_ID: process.env.USER_POOL_CLIENT_ID,
    USER_POOL_CLIENT_SECRET: process.env.USER_POOL_CLIENT_SECRET,
})