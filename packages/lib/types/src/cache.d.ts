export type InternalReconstructedObject = ReconstructedObject & {
    _id?: Id;
    _rev?: Rev;
    _root?: Root;
};
