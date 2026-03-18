import fs from 'node:fs/promises';
import path from 'node:path';
import { parseTariffWorkbook } from './tariffWorkbookParser.mjs';

const [, , inputFilePath, outputFilePath = './public/data/tariff-snapshot.json'] = process.argv;

if (!inputFilePath) {
  console.error('사용법: npm run sync:data -- "<엑셀 파일 경로>" ["출력 파일 경로"]');
  process.exit(1);
}

async function main() {
  const resolvedInputPath = path.resolve(inputFilePath);
  const resolvedOutputPath = path.resolve(outputFilePath);
  const fileBuffer = await fs.readFile(resolvedInputPath);
  const fileStats = await fs.stat(resolvedInputPath);

  const snapshot = await parseTariffWorkbook({
    fileBuffer,
    sourceFileName: path.basename(resolvedInputPath),
    sourceFileLastModified: fileStats.mtime.toISOString(),
    uploadedAt: new Date().toISOString(),
  });

  await fs.mkdir(path.dirname(resolvedOutputPath), { recursive: true });
  await fs.writeFile(resolvedOutputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf-8');

  console.log('관세 스냅샷 생성 완료');
  console.log(`- 입력 파일: ${resolvedInputPath}`);
  console.log(`- 출력 파일: ${resolvedOutputPath}`);
  console.log(`- 제품 수: ${snapshot.uiConfig.products.length}`);
}

main().catch((error) => {
  console.error('관세 스냅샷 생성 실패');
  console.error(error);
  process.exit(1);
});
