/**
 * Data representation.
 * A model has services which provide interfaces for the same domain.
 */
function Model(name)
{
    this._init(name);
}

Model.prototype = {
    observers: [],
    services: [],
    _init: function(name)
    {
        this.name = name;
    },
    attach: function(name, observer)
    {
        this.observers[name] = observer;
    },
    detach: function(name)
    {
        delete this.observers[name];
    },
    notify: function()
    {
        console.log("# observers: " + this.getNumberOfObservers());
        for (var name in this.observers)
        {
            console.log(" - notify observer: " + name);
            this.observers[name].update();
        }
    },
    addService: function(service)
    {
        this.services[service.serviceName] = service;
        service.model = this;
    },
    getService: function(serviceId)
    {
        return this.services[serviceId];
    },
    getNumberOfObservers: function()
    {
        return Object.keys(this.observers).length;
    }

};

