import {PinataSDK} from "pinata";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
})

async function main() {
    const metadata = {
        name: "1er DAN",
        description: "Grade de 1er DAN attribué par la fédération",
        attributes: [
            { trait_type: "grade", value: "1er DAN" },
            { trait_type: "date", value: "2025-04-01" },
            { trait_type: "examiner", value: "0xExaminateurAddress" }
        ]
    };

    const jsonString = JSON.stringify(metadata, null, 2);
    console.log(jsonString);

    const file = new File([jsonString], 'token-id-grade.json', {type: 'application/json'})
    console.log(file.toString())

    const uploaded = await pinata.upload.public.file(file)
    console.log(uploaded);

}

await main();
