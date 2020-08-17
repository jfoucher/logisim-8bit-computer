
const power = `
# mantissa
255 3
# exponent
254 5
LDA 255
STOI 253
OUT 253
LDA 254
SUBI 1
STOI 250
LDA 255
SUBI 1
STOI 252
:start
LDA 252
STOI 251
:inner
LDA 253
ADD 255
STOI 253
LDA 251
SUBI 1
STOI 251
LDA 253
JMPZ next
JMPI inner
:next
OUT 253
STOI 255
LDA 250
SUBI 1
STOI 250
JMPZ end
JMPI start
:end
HLT
`

const divide = `
253 112
254 27
255 0
:start
LDA 253
SUB 254
JMPZ end
JMPC carryend
STOI 253
LDA 255
ADDI 1
STOI 255
OUT 255
JMPI start
:end
LDA 255
ADDI 1
STOI 255
OUT 255
HLT
:carryend
LDA 255
OUT 255
HLT
`;

const fibo = `
:restart
LDAI 0
STO 254
LDAI 1
STO 255
LDA 254
:count
ADD 255
JMPC halt
STO 255
OUT
ADD 254
JMPC halt
STO 254
OUT
JMPI count
:halt
HLT
`;

const faceData = [
    0b00111100,
    0b01000010,
    0b10100101,
    0b10000001,
    0b10100101,
    0b10011001,
    0b01000010,
    0b00111100,
]
const frown = [
    0b10011001,
    0b10100101,
]

const scr = `
:start
LDAI ${faceData[0]}
OUT
LDAI ${faceData[1]}
OUT
LDAI ${faceData[2]}
OUT
LDAI ${faceData[3]}
OUT
LDAI ${faceData[4]}
OUT
LDAI ${faceData[5]}
OUT
LDAI ${faceData[6]}
OUT
LDAI ${faceData[7]}
OUT
JMPI start
`;

const display = `
LDA 248
OUT
LDA 249
OUT
LDA 250
OUT
LDA 251
OUT
LDA 252
OUT
LDA 253
OUT
LDA 254
OUT
LDA 255
OUT
`
const face = `
:start
LDAI 0
STO 247
# load happy face in ram
LDAI ${faceData[0]}
STO 248
LDAI ${faceData[1]}
STO 249
LDAI ${faceData[2]}
STO 250
LDAI ${faceData[3]}
STO 251
LDAI ${faceData[4]}
STO 252
LDAI ${faceData[5]}
STO 253
LDAI ${faceData[6]}
STO 254
LDAI ${faceData[7]}
STO 255

:display
${display}
#listen to keypress
INA
ADDI 255
JMPC replace
JMPI display


:replace
LDA 247
ADDI 1
JMPC frown
JMPI smile

# replace smile with frown
:frown
LDAI 0
STO 247
LDAI ${frown[0]}
STO 252
LDAI ${frown[1]}
STO 253
JMPI display

# replace frown with smile
:smile
LDAI 255
STO 247
LDAI ${faceData[4]}
STO 252
LDAI ${faceData[5]}
STO 253
JMPI display

:delay
${display}
LDA 246
ADDI 1
STO 246
JMPC display
JMPI delay
`;

const pong = `
# Player 1 paddle
244 0
248 56
249 0
250 0
251 0
252 0
253 0
254 0
# Player 2 paddle
255 56

$ballprev 249
$ballcur 249

:start
LDAI 0
STO 246
STO 247
STO 249
STO 250
STO 251
STO 252
STO 253
STO 254
LDAI 56
STO 248
STO 255
LDAI 249
STO 63
LDAI 250
STO 67
LDAI 16
STO 245

:display
${display}
#display ball
:displayball
// remove ball from previous column
LDAI 0
//40 + 24 = 63
STO $ballprev

LDA 245
# this 251 will be replaced later. It's address is 44 + 24 = 67
STO $ballcur

# Move ball
LDA ($ballcur)
// the number here is at address 71
ADDI 2
JMPC reverse
// SUBI is at address 74
SUBI 1
STO ($ballcur)
// SUBI is at address 78
SUBI 1
STO ($ballprev)
JMPI keypress

:reverse
LDA ($ballcur)
STO ($ballprev)
SUBI 1
STO ($ballcur)

:keypress
INA
ADDI 248
JMPC movedown2
ADDI 4
JMPC moveup2
ADDI 2
JMPC movedown1
ADDI 1
JMPC moveup1
JMPI display

:delay
${display}
LDA 246
ADDI 1
STO 246
JMPC display
JMPI delay

:moveup2
# move paddle up
LDA 255
ADD 255
JMPC display
STO 255
JMPI delay

:moveup1
# move paddle up
LDA 248
ADD 248
JMPC display
STO 248
JMPI delay

:movedown2
# ignore if the number is 7 or less
LDA 255
ADDI 248
JMPC startdiv2
JMPI display
:startdiv2
LDA 255
STO 247
LDAI 0
STO 246
:div2
LDA 246
ADDI 1
STO 246
LDA 247
SUBI 2
STO 247
ADDI 254
JMPC div2
LDA 246
STO 255
JMPI delay

:movedown1
# ignore if the number is 7 or less
LDA 248
ADDI 248
JMPC startdiv
JMPI display
:startdiv
LDA 248
STO 247
LDAI 0
STO 246
:div
LDA 246
ADDI 1
STO 246
LDA 247
SUBI 2
STO 247
ADDI 254
JMPC div
LDA 246
STO 248
JMPI delay

`

const input = `
LDAI 0
STO 254
STO 253
:start
LDA 254
:operation
NOP
:operand
NOP
STO 254
OUT
INA
ADDI 254
JMPC subtract
ADDI 1
JMPC add
LDAI 0
STO operation
STO operand
JMPI start
NOP
NOP
NOP
NOP
:add
LDAI 1
STO operand
ADDI 4
STO operation
JMPI delay
NOP
NOP
NOP
NOP
:subtract
NOP
NOP
NOP
NOP
NOP
LDAI 1
STO operand
ADDI 5
STO operation
:delay
LDA 253
ADDI 1
STO 253
JMPC start
JMPI delay

`;

const input2 = `
:start
INA
OUT
JMPI start
`;

const divisor = `
253 15
254 5
LDA 254
SUBI 1
STOI 255
:start
LDA 254
OUT 254
SUB 255
STOI 254
JMPC retry
JMPZ end
JMPI start
:end
LDA 255
OUT 255
HLT
:retry
LDA 253
STOI 254
LDA 255
SUBI 1
STOI 255
OUT 255
JMPI start
`;

const prime = `
253 11
254 11
LDA 254
SUBI 1
STOI 255
:start
LDA 254
OUT 254
JMPZ end
SUB 255
STOI 254
JMPC retry
JMPI start
:end
LDA 255
OUT 255
HLT
:retry
LDA 253
STOI 254
LDA 255
SUBI 1
STOI 255
OUT 255
JMPI start
`;

const jmpTest = `
:start
LDAI 255
ADDI 20
JMPC end
STO 254
LDAI 0
OUT
JMPI start
:end
OUT
JMPI start
`

const monit = `
:start
LDAI 0
OUT
LDA 1
OUT
ADDI 1
STO 1
JMPI start
`;

const increment = `
LDAI 0
LDAI 0
LDAI 0
STO 255
STO 254
:start
LDA 255
ADDI 1
STO 255
OUT

:delay
LDA 254
ADDI 1
STO 254
JMPC start
JMPI delay
`


module.exports = {
    fibo,
    input,
    scr,
    face,
    pong
}