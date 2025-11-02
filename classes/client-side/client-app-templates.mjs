class AppTemplate{
    constructor(){
        this.element = null;
        this.initialized = false;
        this.instanceId = null;
        this.state = {};
    }
    Init(){
        if(this.initialized)return;
        this.initialized = true;
        
    }
    Render(parent='body'){
            this.instanceId = crypto.randomUUID();
            this.element = $('<div>').appendTo(parent);
    }
    Dispose(){
        this.element.remove();
    }
}