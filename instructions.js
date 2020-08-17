const instructions = {
    NOP:     0b00000,
    LDAI:    0b00001,
    LDBI:     0b00010,
    LDA:    0b00011,
    LDB:    0b00100,
    ADDI:     0b00101,
    SUBI:    0b00110,
    ADD:    0b00111,
    SUB:    0b01000,
    OUT:     0b01001,
    JMPI:    0b01010,
    JMP:     0b01011,
    JMPC:    0b01100,
    STO:     0b01101,
    INA:     0b01110,
    HLT:    0b01111,
}


module.exports = instructions