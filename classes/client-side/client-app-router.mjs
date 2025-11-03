class ClientAppRouter{
    constructor(mainLayout='partials/main-layout.hbs', app = new ClientApp()){
        this.mainLayout = mainLayout;
        this.initialized = false;
        this.app = app;    
    }
    async Init(){
        try {            
        if(this.initialized)return;
        this.initialized = true;
        this.RenderMainLayout();
        this.app.logHandler.writeLog("Router Initialized");1
        }
        catch(err){
            this.initialized = false;
            this.app.logHandler.writeLog(err);
        }                   
    }
    async RenderMainLayout(){
        try{
            // Fetch the template using jQuery
            const response = await $.get(this.mainLayout);
            
            // Register it as a partial with Handlebars
            Handlebars.registerPartial('mainLayout', response);
            
            // Create a template that uses the partial
            const template = Handlebars.compile('{{> mainLayout}}');
            
            // Render the template with initial data
            const html = template({
                toolbarTopContent: 'Audio Tools',
                navContent: '<div id="nav-container"></div>', // Placeholder for dynamic navigation
                mainContent: '<div id="main-container"></div>', // Placeholder for route content
                footerContent: '© ' + new Date().getFullYear() + ' Audio Tools'
            });
            
            
            // Insert the rendered HTML into the page
            $('body').html(html);
            
            this.app.logHandler.writeLog("Main layout rendered successfully");
        }
        catch(err) {
            this.app.logHandler.writeLog("Error rendering main layout: " + err);
            throw err;
        }
    }
}