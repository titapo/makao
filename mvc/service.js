class Service
{
    constructor(name)
    {
        this.model = null;
        this.serviceName = name;
    }

    changed()
    {
        console.log(this.serviceName + " service changed");
        if (this.model !== null)
            this.model.notify();
    }
}
