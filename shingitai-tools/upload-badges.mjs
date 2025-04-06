import { PinataSDK } from "pinata";
import { readdir, stat, readFile } from 'fs/promises'
import { join, extname } from 'path'
import {basename} from 'path'

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY, 
})

async function listPngFiles(dirPath) {
    try {
      const entries = await readdir(dirPath)
      const jpgFiles = []
  
      for (const entry of entries) {
        const fullPath = join(dirPath, entry)
        const fileStat = await stat(fullPath)
        if (fileStat.isFile() && extname(entry).toLowerCase() === '.png') {
          jpgFiles.push(fullPath)
        }
      }
  
      return jpgFiles
    } catch (err) {
      console.error('Erreur:', err)
      return []
    }
  }
  
  async function uploadAll(dirPath) {
    try {
      const pngFiles = await listPngFiles(dirPath)
      console.log(`🔍 ${pngFiles.length} fichiers trouvés dans ${dirPath}`)
  
      const listFilesToUpload = []
      for (const fullPath of pngFiles) {
        const buffer = await readFile(fullPath)
        const file = new File([buffer], basename(fullPath), { type: 'image/png' })
        listFilesToUpload.push(file)
        // const uploaded = await pinata.upload.public.file(file)
        // console.log(`✅ ${file.name} → ${uploaded.cid}`)
      }

      const uploaded = await pinata.upload.public.fileArray(listFilesToUpload);
      console.log(`Uploaded: ${uploaded}`)
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload :', error)
    }
  }

async function main(dirPath) {
    await uploadAll(dirPath)
    console.log(process.env.PINATA_JWT);
    console.log(process.env.PINATA_JWT);
    try {
        // Exemple d'utilisation
        listJpgFiles(dirPath).then(files => {
            console.log('Fichiers .png :', files)
        })
        // const file = new File(["hello world!"], "hello.txt", { type: "text/plain" });
        // const upload = await pinata.upload.public.file(file);
        // console.log(upload);
    } catch (error) {
        console.log(error)
    }
}

await uploadAll('./badges');



