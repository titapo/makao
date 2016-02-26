function Service()
{}

Service.prototype = {
    model: null,
    serviceName: "service",
    _init: function(name)
    {
        this.serviceName = name;
    },
    changed: function()
    {
        console.log(this.serviceName + " service changed");
        if (this.model !== null)
            this.model.notify();
    }
}


