use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::{
    fs::read_dir,
    io::{self, Result},
    path::Path,
};

pub struct Node {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Diskust {
    is_file: bool,
    is_dir: bool,
    size: u64,
    files_count: u64,
    whole_path_str: String,
    name: String,
    nodes: Box<Option<Vec<Diskust>>>,
}

impl Diskust {
    pub fn new(path: &Path) -> Result<Diskust> {
        let meta = path.metadata();
        if let Result::Ok(meta) = meta {
            if path.is_symlink() {
                return Result::Err(io::Error::new(io::ErrorKind::NotFound, "skip symlink"));
            }
            if path.is_file() {
                return Ok(Diskust {
                    is_dir: path.is_dir(),
                    is_file: path.is_file(),
                    nodes: Box::new(None),
                    size: meta.len(),
                    files_count: 1,
                    whole_path_str: path.display().to_string(),
                    name: path.file_name().unwrap().to_owned().into_string().unwrap(),
                });
            }
            if path.is_dir() {
                let mut nodes: Vec<Diskust> = read_dir(path)?
                    .par_bridge()
                    .into_par_iter()
                    .flat_map(|entry| {
                        if let Result::Ok(entry) = entry {
                            let node = Self::new(&entry.path());
                            if let Result::Ok(node) = node {
                                Some(node)
                            } else {
                                None
                            }
                        } else {
                            None
                        }
                    })
                    .collect();
                nodes.par_sort_by(|one, two| two.size.cmp(&one.size));
                let size = nodes.iter().map(|Diskust { size, .. }| size).sum();
                let files_count = nodes
                    .iter()
                    .map(|Diskust { files_count, .. }| files_count)
                    .sum();
                let dir_node = Ok(Diskust {
                    is_dir: path.is_dir(),
                    is_file: path.is_file(),
                    nodes: Box::new(Some(nodes)),
                    size,
                    name: path.file_name().unwrap().to_owned().into_string().unwrap(),
                    files_count,
                    whole_path_str: path.display().to_string(),
                });

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
        file.files_count = 0;
        assert_eq!(
            file,
            Diskust {
                is_dir: false,
                is_file: true,
                nodes: Box::new(None),
                size: 0,
                files_count: 0,
                whole_path_str: "./../Cargo.toml".to_string(),
                name: "Cargo.toml".to_string()
            }
        );
    }
}
