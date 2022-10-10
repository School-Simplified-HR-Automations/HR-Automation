import { Client } from "discord.js";
import { sw } from "..";
import deploy from "../appcommands/deploy";
import undeploy from "../appcommands/undeploy";
import { log } from "../services/logger";
import { BootCheck } from "../utils/bootCheck";
import { client } from ".."

client.once("ready", async () => {
    // undeploy()
    deploy()
    await BootCheck.checkUpdate(client)
    log.success(`Readied in ${sw.stop().toString()}!`)
})