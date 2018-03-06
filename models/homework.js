module.exports = function(sequelize, DataTypes) {
	var Homework = sequelize.define("Homework", {
		homeworkname: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1]
			}
		},
		homeworkdesc: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1]
			}
		},
		hwdue: {
			type: DataTypes.DATE,
			allowNull: false
		},
	});
	Homework.associate = function(models) {
		Homework.belongsTo(models.ExistingClass, {
		  foreignKey: {
		    allowNull: false
		  }
		});
		Homework.belongsToMany(models.Student, { through: "AssignedHomework"});
  	};
	return Homework;
}