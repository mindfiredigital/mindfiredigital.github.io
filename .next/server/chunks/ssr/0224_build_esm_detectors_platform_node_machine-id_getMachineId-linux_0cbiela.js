;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="d85379bb-1ed7-0888-94ad-7c64fe51eea8")}catch(e){}}();
module.exports=[36595,a=>{"use strict";var b=a.i(22734),c=a.i(18304);async function d(){for(let a of["/etc/machine-id","/var/lib/dbus/machine-id"])try{return(await b.promises.readFile(a,{encoding:"utf8"})).trim()}catch(a){c.diag.debug(`error reading machine id: ${a}`)}}a.s(["getMachineId",0,d])}];

//# debugId=d85379bb-1ed7-0888-94ad-7c64fe51eea8
//# sourceMappingURL=0224_build_esm_detectors_platform_node_machine-id_getMachineId-linux_0cbiela.js.map