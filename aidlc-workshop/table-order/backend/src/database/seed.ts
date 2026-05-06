import { getDatabase } from './connection';
import { initializeDatabase } from './init';

/**
 * Seed script: 테스트용 데이터 삽입
 * 실행: npx ts-node src/database/seed.ts
 */

function seed() {
  initializeDatabase();
  const db = getDatabase();

  const storeId = 'mystore';

  // Store 생성 (없으면)
  const existingStore = db.prepare('SELECT id FROM stores WHERE id = ?').get(storeId);
  if (!existingStore) {
    db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, '테스트 매장');
  }

  // 카테고리 생성
  const pastaCategory = db.prepare('SELECT id FROM categories WHERE storeId = ? AND name = ?').get(storeId, '파스타류');
  let pastaCategoryId: number;
  if (!pastaCategory) {
    const result = db.prepare('INSERT INTO categories (storeId, name, sortOrder) VALUES (?, ?, ?)').run(storeId, '파스타류', 1);
    pastaCategoryId = result.lastInsertRowid as number;
  } else {
    pastaCategoryId = (pastaCategory as any).id;
  }

  const stewCategory = db.prepare('SELECT id FROM categories WHERE storeId = ? AND name = ?').get(storeId, '찌개류');
  let stewCategoryId: number;
  if (!stewCategory) {
    const result = db.prepare('INSERT INTO categories (storeId, name, sortOrder) VALUES (?, ?, ?)').run(storeId, '찌개류', 2);
    stewCategoryId = result.lastInsertRowid as number;
  } else {
    stewCategoryId = (stewCategory as any).id;
  }

  // 메뉴 삽입 (중복 방지)
  const insertMenu = db.prepare(`
    INSERT OR IGNORE INTO menu_items (categoryId, storeId, name, price, description, sortOrder)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // 파스타류
  insertMenu.run(pastaCategoryId, storeId, '토마토 파스타', 9500, '신선한 토마토 소스의 클래식 파스타', 1);
  insertMenu.run(pastaCategoryId, storeId, '봉골레 파스타', 10000, '바지락이 듬뿍 들어간 봉골레', 2);
  insertMenu.run(pastaCategoryId, storeId, '알리오올리오', 9500, '마늘과 올리브오일의 심플한 조화', 3);

  // 찌개류
  insertMenu.run(stewCategoryId, storeId, '김치찌개', 9000, '잘 익은 김치로 끓인 얼큰한 찌개', 1);
  insertMenu.run(stewCategoryId, storeId, '된장찌개', 9000, '구수한 된장과 신선한 야채', 2);
  insertMenu.run(stewCategoryId, storeId, '순두부찌개', 8500, '부드러운 순두부와 매콤한 양념', 3);

  console.log('✅ Seed data inserted successfully!');
  console.log(`   Store: ${storeId}`);
  console.log(`   Categories: 파스타류, 찌개류`);
  console.log(`   Menus: 6개`);
}

seed();
