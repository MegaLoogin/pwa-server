import fs from 'fs';
import ConfigParser from '@webantic/nginx-config-parser';
import { spawnSync } from 'child_process';

export class NginxConfig{
    parser = new ConfigParser();
    config = null;
    filename = "";

    constructor(filename){
        this.filename = filename;
        this.config = this.readConfig();
    }

    getDomains(){
        return this.config.proxies.map(({server}) => server.server_name);
    }

    getPorts(){
        return this.config.servers.map(({server}) => server.listen);
    }

    updateConfig(){
        let data = fs.readFileSync(this.filename).toString();
    
        const {proxyStart, proxyEnd} = this.readPositions(data);

        const proxyData = '\n'+ this.config.proxies.map(v => this.parser.toConf(v)).join('\n') + '\n';
        const serverData = '\n'+ this.config.servers.map(v => this.parser.toConf(v)).join('\n') + '\n';

        data = this.splice(data, proxyStart, proxyEnd - proxyStart, proxyData);

        const {serverStart, serverEnd} = this.readPositions(data);

        data = this.splice(data, serverStart, serverEnd - serverStart, serverData);

        fs.writeFileSync(this.filename, data);

        const exec = spawnSync("cmd", ["nginx", "-s", "reload"]);
        console.log(exec.stdout.toString());
    }

    removeServer(domain, port){
        if(domain && port) {
            this.config.proxies.forEach(({server, i}) => {
                if(server.server_name === domain && server['location /'].proxy_pass.split(':')[2] == port)
                    this.config.proxies.splice(i, 1);
            });

            this.config.servers.forEach(({server}, i) => {
                if(server['location /'].index.startsWith(domain + '/') && server.listen == port)
                    this.config.servers.splice(i, 1);
            });
        }else{
            this.config.proxies.forEach(({server, i}) => {
                if(server.server_name === domain || server['location /'].proxy_pass.split(':')[2] == port)
                    this.config.proxies.splice(i, 1);
            });

            this.config.servers.forEach(({server}, i) => {
                if(server['location /'].index.startsWith(domain + '/') || server.listen == port)
                    this.config.servers.splice(i, 1);
            });
        }
    }

    addServer(domain, port){
        this.config.proxies.forEach(({server}) => {
            if(server['location /'].proxy_pass.split(':')[2] == port){
                throw `Port ${port} already used`;
            }
    
            if(server.server_name === domain){
                throw `Domain ${domain} already used`;
            }
        });

        this.config.servers.forEach(({server}) => {
            if(server.listen == port){
                throw `Port ${port} already used`;
            }
        });
    
        const server = {
            server: {
                listen: port,
                server_name: 'localhost',
                'location /': {
                    'index': domain + '/index.html'
                }
            }
        }
    
        const proxy = {
            server: {
                listen: '80',
                server_name: domain,
                'location /': {
                    proxy_pass: `http://localhost:${port}`
                }
            }
        }
    
        this.config.servers.push(server);
        this.config.proxies.push(proxy);
    }

    readConfig(){
        let data = fs.readFileSync(this.filename).toString();
    
        const {proxyStart, proxyEnd, serverStart, serverEnd} = this.readPositions(data);
        
        const proxies = this.parser.parse(data.slice(proxyStart, proxyEnd)).server;
        const servers = this.parser.parse(data.slice(serverStart, serverEnd)).server;
        
        return {
            proxies: proxies === undefined ? [] : (Array.isArray(proxies) ? proxies : [proxies]).map(v => v = {server: v}), 
            servers: servers === undefined ? [] : (Array.isArray(servers) ? servers : [servers]).map(v => v = {server: v})
        }
    }

    readPositions(data){
        const proxyStart = data.indexOf("#!proxy-start") + "#!proxy-start".length;
        const proxyEnd = data.indexOf("#!proxy-end");
    
        const serverStart = data.indexOf("#!server-start") + "#!server-start".length;
        const serverEnd = data.indexOf("#!server-end");

        return {proxyStart, proxyEnd, serverStart, serverEnd};
    }

    splice = function(str, start, delCount, newSubStr) {
        return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
    }
}