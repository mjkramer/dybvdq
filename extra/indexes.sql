CREATE TABLE runno_fileno_sitemask (
  runno INTEGER,
  fileno INTEGER,
  sitemask INTEGER NOT NULL,
  streamtype VARCHAR(32) NOT NULL,
  PRIMARY KEY (runno, fileno)
);

CREATE INDEX idx_rfs ON runno_fileno_sitemask (sitemask, streamtype, runno, fileno);
CREATE INDEX idx_drdfi ON DaqRawDataFileInfo (runno, fileno);
CREATE INDEX idx_dqdn ON DqDetectorNew (runno, fileno);

INSERT INTO runno_fileno_sitemask
SELECT DISTINCT runno, fileno, sitemask, streamtype
  FROM DqDetectorNew
         NATURAL JOIN DqDetectorNewVld
         LEFT JOIN DaqRawDataFileInfo USING (runno, fileno)
 WHERE streamtype IN ('Physics', 'ADCalib') AND (
   (sitemask = 1 AND detectorid <= 2 AND runno BETWEEN 21221 AND 67768) OR -- 67768
   (sitemask = 1 AND detectorid  = 2 AND runno >=      67769)           OR -- 67769

   (sitemask = 2 AND detectorid  = 1 AND runno BETWEEN 21221 AND 26693) OR -- 29063
   (sitemask = 2 AND detectorid <= 2 AND runno >=      26694)           OR -- 29064

   (sitemask = 4 AND detectorid <= 3 AND runno BETWEEN 21221 AND 26693) OR
   (sitemask = 4 AND detectorid <= 4 AND runno >=      26694);
