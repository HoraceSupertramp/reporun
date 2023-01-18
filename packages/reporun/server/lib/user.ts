import Config from './../config';
import path from 'path';
import fs from 'fs/promises';
import { parse } from 'csv-parse';
import { User } from 'reporun';

export default class UserImplementation implements User {

    public static async all(config: Config) {
        const csv = await fs.readFile(path.resolve(config.fullClassesPath, '78.csv'), 'utf8')
        return new Promise<User[]>((resolve, reject) => {
            const records: any[] = [];
            const parser = parse({
                delimiter: ','
            });
            parser.on('readable', () => {
                let record;
                while ((record = parser.read()) !== null) {
                    records.push(record);
                }
            });
            parser.on('error', (error) => {
                reject(error);
            });
            parser.on('end', async () => {
                resolve(
                    records
                        .slice(1)
                        .map((record) => new UserImplementation(
                            record[0],
                            record[1],
                            record[3],
                        ))
                );
            });
            parser.write(csv);
            parser.end();
        });
    }

    constructor(
        public readonly name: string,
        public readonly surname: string,
        public readonly id: string,
    ){}

}
