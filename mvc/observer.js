function Observer(name, model)
{
    this._init(name, model);
}

Observer.prototype = {
    name: '',
    model: null,
    _init: function(name, model)
    {
        this.name = name;
        this.model = model;
        this.model.attach(this.name, this);
    },
    update: function()
    { console.log("(" + this.name + ") Generic observer!")}
};

