class APIFeatures {
   constructor(query, queryString) {
      this.query = query; // query
      this.queryString = queryString; // req.query
   }

   filter() {
      // --------- 1A) Basic Filtering ---------
      const queryObj = { ...this.queryString }; // hard copy of req.query object instead of reference
      const excludedFields = ['page', 'sort', 'limit', 'fields']; // this query fields will be ignored
      excludedFields.forEach(el => delete queryObj[el]);


      // --------- 1B) Advanced Filtering ---------
      // for greater than, less than queries

      // { duration: { 'gte': '5' }, difficulty: 'easy' } the one we get
      // { duration: { '$gte': '5' }, difficulty: 'easy' } the one we need for mongodb

      let queryStr = JSON.stringify(queryObj); // convert json to string

      // turn gte into $gte
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // \b for exact match, g for multiple

      const queryJson = JSON.parse(queryStr);

      // didn't await here for further chaining like sorting, limiting
      this.query = this.query.find(queryJson); // if nothing is passed in find method, it returns all the results

      return this;
   }



   sort() {
      // --------- 2) Sorting ---------
      if (this.queryString.sort) {
         // mongodb works like this -> sort(price rating) for multiple sorting criterias
         // but we get response like this -> sort=price,rating
         // so we need to split
         const sortBy = this.queryString.sort.split(',').join(' ');
         this.query = this.query.sort(sortBy);
      } else {
         this.query = this.query.sort('-createdAt'); // by default sort by time created at. '-' sign for desc order
      }

      return this;
   }



   limitFields() {
      // --------- 3) Limiting Fields (Projection) ---------
      // only show selected data
      if (this.queryString.fields) {
         // mongodb works like this -> select(price rating) for multiple sorting criterias
         // but we get response like this -> fields=price,rating
         // so we need to split
         const fields = this.queryString.fields.split(',').join(' ');
         this.query = this.query.select(fields);
      } else {
         this.query = this.query.select('-__v'); // '-' sign excludes __v
      }

      return this;
   }



   paginate() {
      // --------- 4) Pagination ---------
      const page = this.queryString.page * 1 || 1; // convert string to number, by default current page is 1st page
      const limit = this.queryString.limit * 1 || 100; // by default 100
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);

      return this;
   }
};

module.exports = APIFeatures;