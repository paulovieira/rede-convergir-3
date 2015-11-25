module.exports = {

    publicUri: "",
    publicPort: 80,

    email: {
        mandrill: {
            apiKey: "85lzzANtRJ46i_mLLRjHoQ"
        },
    },

    ironPassword: "fijuweojigsd324",
    
    db: {

        // should be redefined in some other configuration file (that should be present in .gitignore)
        postgres: {
            host: "127.0.0.1",
            port: 5433,
            database: "test3",
            username: "pvieira",
            password: "budapeste",

            getConnectionString: function(){
                return "postgres://" +
                        this.username + ":" +
                        this.password + "@" +
                        this.host + ":" + this.port +  "/" +
                        this.database;
            }
        },
    }
};
