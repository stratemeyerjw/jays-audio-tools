class ClientApp{
    constructor(){
        if(!!ClientApp.instance) return ClientApp.instance;
        this.initialized = false;
    }
    async Init(){
        try{
            if(this.initialized)return;
            this.initialize = true;
            console.log("Client App Initialized")
        }catch(err){
            this.initialized = false;
            console.error(err);
        }
    }
} 


$(()=>{
    window.app = new ClientApp();
    window.app.Init();
})