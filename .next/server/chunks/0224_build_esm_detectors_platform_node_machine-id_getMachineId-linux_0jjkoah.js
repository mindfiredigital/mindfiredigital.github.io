;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="315aabc5-8511-57b4-fc99-ecdb86c89bca")}catch(e){}}();
module.exports=[68246,e=>{"use strict";var i=e.i(22734),r=e.i(4065);async function a(){for(let e of["/etc/machine-id","/var/lib/dbus/machine-id"])try{return(await i.promises.readFile(e,{encoding:"utf8"})).trim()}catch(e){r.diag.debug(`error reading machine id: ${e}`)}}e.s(["getMachineId",0,a])}];

//# debugId=315aabc5-8511-57b4-fc99-ecdb86c89bca
//# sourceMappingURL=0224_build_esm_detectors_platform_node_machine-id_getMachineId-linux_0jjkoah.js.map