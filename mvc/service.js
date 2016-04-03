class Service
{
    constructor(name)
    {
        this.model = null;
        this.serviceName = name;
        this.logger = new Logger("srv-" + name)
    }

    changed()
    {
        this.logger.debug(this.serviceName + " service changed");
        if (this.model !== null)
            this.model.notify();
    }
}
