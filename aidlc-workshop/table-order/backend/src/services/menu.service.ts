import { getDatabase } from '../database/connection';
import { sseService } from './sse.service';
import {
  MenuItem,
  Category,
  CreateMenuDTO,
  UpdateMenuDTO,
  CreateCategoryDTO,
} from '../models/types';

export class MenuService {
  getCategories(storeId: string): Category[] {
    const db = getDatabase();
    return db
      .prepare('SELECT * FROM categories WHERE storeId = ? ORDER BY sortOrder ASC')
      .all(storeId) as Category[];
  }

  createCategory(dto: CreateCategoryDTO): Category {
    const db = getDatabase();

    if (!dto.name || !dto.storeId) {
      throw new Error('name and storeId are required');
    }

    // Get next sort order
    const maxOrder = db
      .prepare('SELECT MAX(sortOrder) as maxOrder FROM categories WHERE storeId = ?')
      .get(dto.storeId) as { maxOrder: number | null };
    const sortOrder = dto.sortOrder ?? (maxOrder.maxOrder ?? -1) + 1;

    const result = db
      .prepare('INSERT INTO categories (storeId, name, sortOrder) VALUES (?, ?, ?)')
      .run(dto.storeId, dto.name, sortOrder);

    return {
      id: result.lastInsertRowid as number,
      storeId: dto.storeId,
      name: dto.name,
      sortOrder,
    };
  }

  getMenus(storeId: string, categoryId?: number, includeUnavailable = false): MenuItem[] {
    const db = getDatabase();
    let query = 'SELECT * FROM menu_items WHERE storeId = ?';
    const params: any[] = [storeId];

    if (categoryId) {
      query += ' AND categoryId = ?';
      params.push(categoryId);
    }

    if (!includeUnavailable) {
      query += ' AND isAvailable = 1';
    }

    query += ' ORDER BY sortOrder ASC';
    return db.prepare(query).all(...params) as MenuItem[];
  }

  getMenuById(menuId: number): MenuItem | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM menu_items WHERE id = ?').get(menuId) as MenuItem | undefined;
  }

  createMenu(dto: CreateMenuDTO): MenuItem {
    const db = getDatabase();

    // Validate required fields
    if (!dto.name || dto.price === undefined || !dto.categoryId || !dto.storeId) {
      throw new Error('name, price, categoryId, storeId are required');
    }
    if (dto.name.length > 100) {
      throw new Error('name must be 100 characters or less');
    }
    if (dto.price < 0) {
      throw new Error('price must be 0 or greater');
    }
    if (dto.description && dto.description.length > 500) {
      throw new Error('description must be 500 characters or less');
    }

    // Verify category exists and belongs to store
    const category = db
      .prepare('SELECT id FROM categories WHERE id = ? AND storeId = ?')
      .get(dto.categoryId, dto.storeId);
    if (!category) {
      throw new Error('Category not found in this store');
    }

    // Get next sort order
    const maxOrder = db
      .prepare('SELECT MAX(sortOrder) as maxOrder FROM menu_items WHERE categoryId = ?')
      .get(dto.categoryId) as { maxOrder: number | null };
    const sortOrder = dto.sortOrder ?? (maxOrder.maxOrder ?? -1) + 1;

    const result = db
      .prepare(
        `INSERT INTO menu_items (categoryId, storeId, name, price, description, imageUrl, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        dto.categoryId,
        dto.storeId,
        dto.name,
        dto.price,
        dto.description || null,
        dto.imageUrl || null,
        sortOrder
      );

    return this.getMenuById(result.lastInsertRowid as number)!;
  }

  updateMenu(menuId: number, storeId: string, dto: UpdateMenuDTO): MenuItem {
    const db = getDatabase();

    const existing = db
      .prepare('SELECT * FROM menu_items WHERE id = ? AND storeId = ?')
      .get(menuId, storeId) as MenuItem | undefined;
    if (!existing) {
      throw new Error('Menu item not found');
    }

    // Validate
    if (dto.name !== undefined && dto.name.length > 100) {
      throw new Error('name must be 100 characters or less');
    }
    if (dto.price !== undefined && dto.price < 0) {
      throw new Error('price must be 0 or greater');
    }
    if (dto.description !== undefined && dto.description.length > 500) {
      throw new Error('description must be 500 characters or less');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (dto.name !== undefined) { updates.push('name = ?'); params.push(dto.name); }
    if (dto.price !== undefined) { updates.push('price = ?'); params.push(dto.price); }
    if (dto.description !== undefined) { updates.push('description = ?'); params.push(dto.description); }
    if (dto.imageUrl !== undefined) { updates.push('imageUrl = ?'); params.push(dto.imageUrl); }
    if (dto.categoryId !== undefined) { updates.push('categoryId = ?'); params.push(dto.categoryId); }
    if (dto.sortOrder !== undefined) { updates.push('sortOrder = ?'); params.push(dto.sortOrder); }
    if (dto.isAvailable !== undefined) { updates.push('isAvailable = ?'); params.push(dto.isAvailable); }

    if (updates.length === 0) {
      return existing;
    }

    params.push(menuId);
    db.prepare(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = this.getMenuById(menuId)!;

    // Broadcast menu availability change to all table clients
    if (dto.isAvailable !== undefined && dto.isAvailable !== existing.isAvailable) {
      sseService.broadcastToAllTables(storeId, 'menu_updated', updated);
    }

    return updated;
  }

  deleteMenu(menuId: number, storeId: string): void {
    const db = getDatabase();
    const result = db
      .prepare('DELETE FROM menu_items WHERE id = ? AND storeId = ?')
      .run(menuId, storeId);
    if (result.changes === 0) {
      throw new Error('Menu item not found');
    }
  }
}

export const menuService = new MenuService();
