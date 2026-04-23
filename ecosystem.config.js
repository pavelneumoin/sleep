module.exports = {
    apps: [{
        name: 'sonotracker',
        script: 'server/server.js',
        cwd: '/home/pavel/projects/arina-project',
        interpreter: 'node',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
            YANDEX_FOLDER_ID: "b1grml8kquv3uh21478n",
            YANDEX_API_KEY: process.env.YANDEX_API_KEY || ''
        }
    }]
};
