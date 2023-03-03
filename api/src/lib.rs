use file_size::fit_4;
use std::{
    fs::read_dir,
    io::{self, Result},
    path::Path,
};

pub struct Node {}

#[derive(Debug, PartialEq)]
pub struct Diskust {
    is_file: bool,
    is_dir: bool,
    size: u64,
    nodes: Box<Option<Vec<Diskust>>>,
}

impl Diskust {
    fn new(path: &Path) -> Result<Diskust> {
        let meta = path.metadata();
        if let Result::Ok(meta) = meta {
            if meta.is_symlink() {
                return Result::Err(io::Error::new(io::ErrorKind::NotFound, "skip symlink"));
            }
            if meta.is_file() {
                println!("file {} {}", path.to_str().unwrap(), fit_4(meta.len()));
                return Ok(Diskust {
                    is_dir: meta.is_dir(),
                    is_file: meta.is_file(),
                    nodes: Box::new(None),
                    size: meta.len(),
                });
            }
            if meta.is_dir() {
                let mut nodes: Vec<Diskust> = vec![];
                for entry in read_dir(path)? {
                    if let Result::Ok(entry) = entry {
                        let node = Self::new(&entry.path());
                        if let Result::Ok(node) = node {
                            nodes.push(node);
                        } else {
                        }
                    }
                }
                let size = nodes.iter().map(|Diskust { size, .. }| size).sum();
                let dir_node = Ok(Diskust {
                    is_dir: meta.is_dir(),
                    is_file: meta.is_file(),
                    nodes: Box::new(Some(nodes)),
                    size,
                });
                println!("dir {} {} MB", path.to_str().unwrap(), fit_4(size));

                return dir_node;
            }

            return Result::Err(io::Error::new(io::ErrorKind::NotFound, "no way"));
        } else {
            return Result::Err(meta.err().unwrap());
        }
    }
}

#[cfg(test)]
mod tests {
    use std::io::ErrorKind;

    use super::*;

    #[test]
    fn empty() {
        assert_eq!(
            Diskust::new(Path::new(&"./no_such_directory".to_string()))
                .err()
                .unwrap()
                .kind(),
            ErrorKind::NotFound
        );
    }
    #[test]
    fn file() {
        let mut file = Diskust::new(Path::new(&"./../Cargo.toml".to_string())).unwrap();
        file.size = 0; // for test
        assert_eq!(
            file,
            Diskust {
                is_dir: false,
                is_file: true,
                nodes: Box::new(None),
                size: 0
            }
        );
    }
    #[test]
    fn test() {
        let d = Diskust::new(Path::new(&"/home/arti1793".to_string()));
        println!("{:?}", d.unwrap().size);
    }
}
