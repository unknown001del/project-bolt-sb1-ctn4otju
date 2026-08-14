export interface TableDef {
  name: string;
  columns: { name: string; type: string; pk?: boolean; nullable?: boolean }[];
}

export function generatePrismaSchema(tables: TableDef[]) {
  const header = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url = env("DATABASE_URL")\n}\n\n`;

  const models = tables.map(t => {
    const fields = t.columns.map(c => {
      const optional = c.nullable ? '?' : '';
      const typeMap: Record<string,string> = { string: 'String', int: 'Int', boolean: 'Boolean', date: 'DateTime' };
      const tpe = typeMap[c.type] || c.type;
      return `  ${c.name} ${tpe}${optional}${c.pk? ' @id' : ''}`;
    }).join('\n');
    return `model ${t.name} {\n${fields}\n}`;
  }).join('\n\n');

  return header + models;
}
