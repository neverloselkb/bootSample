export interface ItemOption {
    name: string;
    value: string;
}

export interface DiabloItem {
    name: string;
    power: number;
    requiredLevel: number;
    type: string;
    options: ItemOption[];
    rawText: string;
}

/**
 * OCR로 추출된 Raw Text를 분석하여 DiabloItem 객체로 변환합니다.
 */
export const parseItem = (text: string): DiabloItem => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // 기본값 초기화
    let name = "알 수 없는 아이템";
    let power = 0;
    let requiredLevel = 0;
    let type = "기타";
    const options: ItemOption[] = [];

    // 정규식 패턴
    const powerRegex = /아이템 위력\s*(\d+)/;
    const levelRegex = /요구 레벨\s*:\s*(\d+)/;
    const typeRegex = /(투구|가슴 방어구|장갑|바지|장화|목걸이|반지|도검|단검|미늘창|양손 검|양손 도끼|양손 철퇴|지팡이|마법봉|중심점|방패|토템)/;

    // 파싱 로직
    // 1. 아이템 위력 찾기
    const powerMatch = text.match(powerRegex);
    if (powerMatch) {
        power = parseInt(powerMatch[1], 10);
    }

    // 2. 요구 레벨 찾기
    const levelMatch = text.match(levelRegex);
    if (levelMatch) {
        requiredLevel = parseInt(levelMatch[1], 10);
    }

    // 3. 줄 단위 분석
    lines.forEach((line, index) => {
        // 아이템 이름 (보통 첫 번째 의미 있는 줄이나 위력 근처)
        // 여기서는 단순하게 첫 줄을 이름으로 가정하되, 보완 필요
        if (index === 0) {
            name = line;
        }

        // 아이템 타입
        if (type === "기타") {
            const typeMatch = line.match(typeRegex);
            if (typeMatch) {
                type = typeMatch[1];
            }
        }

        // 옵션 (구체적인 로직 필요, 여기서는 '+'로 시작하거나 특정 키워드가 있는 줄을 옵션으로 간주)
        // 예: "+12.5% 이동 속도" 또는 "극대화 확률 5.0%"
        const isOption = line.startsWith('+') || line.includes('%') || line.includes('등급');
        if (isOption && !line.includes('아이템 위력')) {
            // 간단한 분리: 숫자가 포함된 부분과 텍스트 부분
            // 예: "+12.5% 이동 속도" -> value: "+12.5%", name: "이동 속도"
            const valueMatch = line.match(/([+\-]?[\d,.]+%?)/);
            if (valueMatch) {
                const value = valueMatch[1];
                const namePart = line.replace(value, '').trim();
                if (namePart.length > 1) { // 너무 짧은 건 노이즈일 수 있음
                    options.push({ name: namePart, value: value });
                }
            }
        }
    });

    return {
        name,
        power,
        requiredLevel,
        type,
        options,
        rawText: text
    };
};
