const DISPLAY_NUMBER = 1;
const DISPLAY_PANEL = 2;
const instructions = require('./instructions')

const fs = require('fs');

const programs = fs.readFileSync('./rom.bin')

const prgNum = 0 * 8;
let pc = 0;
let ra = 0;
let rb = 0
let inst = 0
let carry = 0;
let pressed = null;
let col = 0;
let speed = 2000;
let pause = false;
let stop = false;
process.stdout.cursorTo(0, 0);
process.stdout.clearScreenDown();
process.stdout.write("\x1B[?25l")
var stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
const listener = function( key )
{
    if (key.toString() === 'q') {
        process.stdout.cursorTo(0, 0);
        process.stdout.clearScreenDown();
        process.stdout.write("\x1B[?25h")
        process.exit();
    }

    if(key.toString() === ' ') {
        if (!pause) {
            pause = true;
        } else {
            running();
        }

    }

    const n = parseInt(key.toString(), 10)
    if (n) {
        pressed = n;
        return;
    }
    pressed = null;
}

stdin.on( 'data', listener)

const display = DISPLAY_PANEL;

let mem = programs.slice(prgNum * 256, (prgNum + 1) * 256);


let running = () => {
    inst = mem[pc];
    
    process.stdout.cursorTo(40, 0);
    process.stdout.write("pressed: "+pressed + "   ");
    process.stdout.cursorTo(40, 1);
    process.stdout.write("pc: #"+pc.toString(16) + "   " + pc.toString(10) + "     ");
    process.stdout.cursorTo(40, 2);
    process.stdout.write("RA: #"+ra.toString(16) + "   ");
    process.stdout.cursorTo(40, 4);

    const instrVals = Object.values(instructions)
    const instStr = Object.keys(instructions)[instrVals.findIndex(v => v === inst)]
    if (typeof instStr === 'undefined') {
        stop = true;
    }
    process.stdout.write("INST: " + inst+"    " +instStr + "    val: " + mem[pc+1].toString(10) + "    ");

    process.stdout.cursorTo(40, 6);
    process.stdout.write("244: "+mem[244].toString(10) + "   ");
    process.stdout.cursorTo(40, 7);
    process.stdout.write("245: 0B"+("00000000" + mem[245].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 8);
    process.stdout.write("246: 0B"+("00000000" + mem[246].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 9);
    process.stdout.write("247: 0B"+("00000000" + mem[247].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 10);
    process.stdout.write("248: 0B"+("00000000" + mem[248].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 11);
    process.stdout.write("249: 0B"+("00000000" + mem[249].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 12);
    process.stdout.write("250: 0B"+("00000000" + mem[250].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 13);
    process.stdout.write("251: 0B"+("00000000" + mem[251].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 14);
    process.stdout.write("252: 0B"+("00000000" + mem[252].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 15);
    process.stdout.write("253: 0B"+("00000000" + mem[253].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 16);
    process.stdout.write("254: 0B"+("00000000" + mem[254].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 17);
    process.stdout.write("255: 0B"+("00000000" + mem[255].toString(2)).slice(-8) + "   ");
    process.stdout.cursorTo(40, 18);
    process.stdout.write("63: "+mem[63].toString(10) + "   ");
    process.stdout.cursorTo(40, 19);
    process.stdout.write("67: "+mem[67].toString(10) + "   ");
    //console.log('RA',ra);

    switch (inst) {
        case instructions.NOP:
            pc += 1;
            break;
        case instructions.LDAI:
            ra = mem[pc + 1];
            pc +=2
            break;
        case instructions.LDBI:
            rb = mem[pc + 1];
            pc +=2
            break;
        case instructions.LDA:
            ra = mem[mem[pc + 1]];
            pc +=2
            break;
        case instructions.LDB:
            rb = mem[mem[pc + 1]];
            pc +=2
            break;
        case instructions.ADDI:
            ra += mem[pc + 1];
            carry = 0;
            if (ra > 255) {
                ra -= 256;
                carry = 1;
            }
            pc +=2
            break;

        case instructions.SUBI:
            ra -= mem[pc + 1];
            carry = 0;
            if (ra < 0) {
                ra += 256;
            }
            pc +=2
            break;
        case instructions.ADD:
            carry = 0;
            //console.log('ADD')
            ra += mem[mem[pc + 1]];
            //console.log('added addr', mem[pc + 1], 'data', mem[mem[pc + 1]])
            if (ra > 255) {
                ra -= 256;
                carry = 1;
            }
            pc +=2
            break;
        case instructions.SUB:
            carry = 0;
            ra -= mem[mem[pc + 1]];
            if (ra < 0) {
                ra += 256;
            }
            pc +=2
            break;

        case instructions.OUT:
            //console.log(ra)
            //console.log(ra.toString(2))
            if (display === DISPLAY_NUMBER) {
                process.stdout.clearLine();  // clear current text
                process.stdout.cursorTo(0);  // move cursor to beginning of line
                process.stdout.write(ra.toString(10));  // write text
            }
            if (display === DISPLAY_PANEL) {
                process.stdout.cursorTo(0, col);
                process.stdout.write(("00000000" + ra.toString(2)).slice(-8).replace(/0/g, ' ').replace(/1/g, '█'));
                col += 1;
                if (col >= 8) {
                    col = 0;
                    //process.stdout.clearScreenDown();
                }
            }
            
            pc +=1
            break;

        case instructions.JMPI:
            pc = mem[pc + 1]
            break;
        case instructions.JMP:
            pc = mem[mem[pc + 1]]
            break;
        
        case instructions.JMPC:
            //console.log('jmpc')
            if (carry) {
                //console.log('jumping to', mem[pc + 1])
                pc = mem[pc + 1];
            } else {
                //console.log('not jumping')
                pc +=2
            }
            break;
        case instructions.STO:
            let addr = mem[pc + 1]
            mem[addr] = ra;
            pc +=2;
            break;
        
        case instructions.INA:
            //console.log('INA')
            ra = 0;
            if (pressed) {
                //console.log('pressed', pressed)
                ra = pressed;
                pressed = null;
            }
            pc += 1;
            
            break;

        case instructions.HLT:
            stop = true;
            break

        default:
            pc += 1;
    }

    if (!stop && !pause) {
        setTimeout(running, speed);
    }
}

running();