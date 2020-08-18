
import * as fs from "fs";
import { Stats, DirectoryEntry, Mode } from "@saggitarius/filesystem/dist/driver";

class FileDescriptor {
    public constructor(
        public readonly id: number,
        public readonly path: string,
    ) {}
}

class DirectoryDescriptor {
    public constructor(
        public readonly dir: fs.Dir,
        public readonly path: string,
    ) {}
}

type Descriptor = FileDescriptor | DirectoryDescriptor;


export function stat(path: string): Promise<Stats> {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    ctime: stats.ctimeMs,
                    atime: stats.atimeMs,
                });
            }
        });
    });
}

export function fstat(fd: FileDescriptor): Promise<Stats> {
    return new Promise((resolve, reject) => {
        fs.fstat(fd.id, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    ctime: stats.ctimeMs,
                    atime: stats.atimeMs,
                });
            }
        });
    });
}


export function chmod(path: string, chmod: number): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.chmod(path, chmod, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}

export function chown(path: string, user: number, group: number): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.chown(path, user, group, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function close(fd: Descriptor): Promise<void> {
    if (fd instanceof FileDescriptor) {
        return new Promise((resolve, reject) => {
            fs.close(fd.id, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    if (fd instanceof DirectoryDescriptor) {
        return fd.dir.close();
    }
    return Promise.reject(new Error("Unrecognised descriptor"));
}

export function mkdir(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function rmdir(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.rmdir(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

}

export function openfile(path: string, mode: Mode): Promise<FileDescriptor> {
    return new Promise((resolve, reject) => {
        fs.open(path, mode, (err, fd) => {
            if (err) {
                reject(err);
            } else {
                resolve(new FileDescriptor(fd, path));
            }
        });
    });
}

export function opendir(path: string): Promise<DirectoryDescriptor> {
    return new Promise((resolve, reject) => {
        fs.opendir(path, (err, dd) => {
            if (err) {
                reject(err);
            } else {
                resolve(new DirectoryDescriptor(dd, path));
            }
        });
    });
}

export async function *list(dd: DirectoryDescriptor): AsyncIterable<DirectoryEntry> {
    if (dd instanceof DirectoryDescriptor) {
        for await (const entry of dd.dir) {
            if (entry) {
                yield {
                    name: entry.name,
                    isFile: entry.isFile(),
                    isDirectory: entry.isDirectory(),
                };
            }
        }
        return;
    }
    throw new Error("Invalid descriptor");
}

export async function read(fd: FileDescriptor, length?: number): Promise<Buffer> {
    if (!(fd instanceof FileDescriptor)) {
        return Promise.reject("invalid descriptor");
    }
    debugger;
    if (typeof(length) === "undefined") {
        length = (await fstat(fd)).size;
    }
    return new Promise((resolve, reject) => {
        debugger;
        const buf = Buffer.alloc(length || 16 * 1024);
        fs.read(fd.id, buf, 0, buf.byteLength, null, (err, count, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}

export function write(fd: FileDescriptor, buffer: Buffer): Promise<void> {
    if (!(fd instanceof FileDescriptor)) {
        return Promise.reject("invalid descriptor");
    }
    return new Promise((resolve, reject) => {
        const buf = Buffer.from(buffer);
        fs.write(fd.id, buf, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}

export function rename(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function link(target: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.link(path, target, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function symlink(target: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.symlink(path, target, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function unlink(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function realpath(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export async function remove(fd: Descriptor): Promise<void> {
    await close(fd);
    await unlink(fd.path);
}
