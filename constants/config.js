const corsOptions={
      origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.CLIENT_URL,
    "https://chatify-client-rust.vercel.app",
  ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      
}

export const CHATIFY_TOKEN="chatify"

export {corsOptions}

// const corsOptions={
//   origin: [
//       "http://localhost:5173",
//       "http://localhost:4173",
//       "http://localhost:3000",
//       process.env.CLIENT_URL,
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
// }

// export const CHATIFY_TOKEN="chatify"

// export {corsOptions}