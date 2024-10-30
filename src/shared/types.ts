export interface Player {
    id: string;
    name: string;
    exp: number;
    health: number; // Adiciona `health` (vida)
    maxHealth: number;
    mana: number;   // Adiciona `mana`
    maxMana: number;
}

export interface Message {
    from: string;
    content: string;
}
