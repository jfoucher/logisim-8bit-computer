// asy.js

// Assembler for logisim computer
const fs = require('fs');
const programs = require("./programs");
let DEBUG = 0;

if(DEBUG > 0) {
    console.log(programs);
}


//Instructions index

const instructions = require('./instructions')



const assemble = (program) => {
    const lines = program.split("\n").filter(l => l.length > 0);

    const mem = new Array(256).fill(0);
    let address = 0;
    let labels = {};
    let vars = {};
    let add = 0;
    try {
        // Labels pass
        const lm = lines.map((l) => {
            //Remove trailing comments
            if (l.indexOf('#') === 0 || l.indexOf('//') === 0) {
                return null;
            }
            if (l.indexOf(':') === 0) {
                const lab = l.replace(':', '');
                labels[lab] = address;
                return null;
            }
            if (l.indexOf('$') === 0) {
                const v = l.replace('$', '').split(' ');
                console.log('setting variable default value for', v[0], 'to', v[1])
                vars[v[0]] = {val: parseInt(v[1], 10)};
                return null;
            }

            if (l.indexOf(' ') > 0) {
                //has an argument
                const sp = l.split(' ');

                // Onyl increment address if it is an instruction or a variable instruction
                if (l.indexOf('$') === 0 || l.indexOf('($') === 0 || typeof instructions[sp[0]] !== 'undefined') {
                    address += sp.length;
                }
            } else {
                address += 1;
            }
            if (DEBUG > 1) {
                console.log(l);
            }
            
            return l;
        }).filter(n => n !== null)
        // Syntax pass
        if (DEBUG > 1) {
            console.log('address', address);
            console.log('lines', lm)
        }
        
        lm.forEach((l, i) => {
            
            if (l.indexOf(':') === 0) {
                return;
            }
            if (l.indexOf(' ') > 0) {
                //has an argument
                const sp = l.split(' ');
                if (typeof instructions[sp[0]] === 'undefined') {
                    //This is not an instruction

                    // Is it a variable instruction
                    if (sp[0].indexOf('$') === 0) {
                        // It is a variable instruction, 
                        // save its address
                        const v = sp[0].replace('$', '')

                        vars[v].address = add;
                        if (typeof instructions[vars[v].val] !== 'undefined') {
                            mem[add] = instructions[vars[v].val].toString(16);
                            add++;
                        } else {
                            console.log('could not use this variable instruction', vars[v])
                        }
                    }
                    if (sp[1].indexOf('$') === 0){
                        // This is a variable value
                        // replace with real value
                        const v = sp[1].replace('$', '')
                        console.log('replacing var value', v ,'with', vars[v].val)
                        
                        mem[add] = vars[v].val.toString(16);
                        // Set address
                        vars[v].address = add;
                        console.log('VARS V', vars[v]);
                        add++;
                    }
                    if (sp[1].indexOf('($') === 0) {
                        // This is a variable address value
                        // replace with real address

                        const v = sp[1].replace('($', '').replace(')', '')
                        console.log('replacing var address', v ,'with', vars[v].address)
                        mem[add] = vars[v].address.toString(16);
                        add++;
                    }
                    if (sp[1].indexOf('($') === -1 && sp[1].indexOf('$') === -1 && sp[0].indexOf('$') === -1) {
                        //This is an adress value, create it there
                                            
                        const val = parseInt(sp[1], 10);
                        if (isNaN(val)) {
                            throw new Error('Instruction ' + l + ' is undefined at line ' + i);
                        }
                        if(DEBUG > 1) {
                            console.log('creating address value for ', sp);
                        }
                        mem[parseInt(sp[0], 10)] = val.toString(16);
                        //add--;
                    }
                } else {
                    if(DEBUG > 1) {
                        console.log('creating instruction for ', sp[0]);
                    }
                    mem[add] = instructions[sp[0]].toString(16);
                    add++;
                    // Is it a label ?
                    if (sp[1].indexOf('$') === 0){
                        // This is a variable value
                        // replace with real value
                        const v = sp[1].replace('$', '')
                        console.log('replacing var value', v ,'with', vars[v].val)
                        
                        mem[add] = vars[v].val.toString(16);
                        // Set address
                        vars[v].address = add;
                        add++;
                    } else if (sp[1].indexOf('($') === 0){
                        // This is a variable address value
                        // replace with real address

                        const v = sp[1].replace('($', '').replace(')', '')
                        console.log('replacing var address', v ,'with', vars[v].address)
                        mem[add] = vars[v].address.toString(16);
                        add++;
                    } else {
                        let ramAddress = parseInt(sp[1], 10);

                        if (typeof labels[sp[1]] !== 'undefined') {
                            if(DEBUG > 1) {
                                console.log('is a label ', sp[1]);
                            }
                            ramAddress = labels[sp[1]];
                        }
                        mem[add] = ramAddress.toString(16);
                        add++
                    }
                    
                }
            } else {
                if (typeof instructions[l] === 'undefined') {
                    throw new Error('Instruction ' + l + ' is undefined at line ' + i);
                }
                if(DEBUG > 1) {
                    console.log('single elementt ', l);
                }
                
                mem[add] = instructions[l].toString(16);
                add++;
            }
        });
        if(DEBUG > 0) {
            console.log('labels', labels);
            console.log('address', address)
            console.log('vars', vars)
        }
    } catch (er) {
        return console.error(er);
    }
    return mem;
}


DEBUG = 2;
let mem = assemble(programs.pong);

const pong = mem.map(m => parseInt(m, 16));

if(DEBUG > 1) {
    console.log(pong.map((m, i) => i + "      " + m.toString(10)).join("\n"));
}

DEBUG = 0;

mem = assemble(programs.face);

const face = mem.map(m => parseInt(m, 16));

mem = assemble(programs.fibo);

const fibo = mem.map(m => parseInt(m, 16));

mem = assemble(programs.input);

const input = mem.map(m => parseInt(m, 16));


//console.log(pong.map(m => m.toString(10)).join(', '));


let path = 'rom.bin';
let buffer = new Buffer([
    ...pong, ...pong, ...pong, ...pong, ...pong, ...pong, ...pong, ...pong,
    ...fibo, ...fibo, ...fibo, ...fibo, ...fibo, ...fibo, ...fibo, ...fibo,
    ...input, ...input, ...input, ...input, ...input, ...input, ...input, ...input,
    ...face, ...face, ...face, ...face, ...face, ...face, ...face, ...face,
]);

fs.writeFile(path, buffer, function(err) {
    // If an error occurred, show it and return
    if(err) return console.error(err);
    // Successfully wrote binary contents to the file!
  });

