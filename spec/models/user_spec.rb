require 'spec_helper'

describe User do

  before { @user = User.new name: "example", email: "example@example.com", password: "foobar", password_confirmation: "foobar" }

  subject { @user }

  it { should be_valid }
  it { should respond_to(:name) }
  it { should respond_to(:email) } 
  it { should respond_to(:password_digest) }
  it { should respond_to(:password) }
  it { should respond_to(:password_confirmation) }
  it { should respond_to(:authenticate) }

  describe "when email is blank" do
    before { @user.email = "" }
    it { should_not be_valid }
  end

  describe "when name is blank" do
    before { @user.name = "" }
    it { should_not be_valid }
  end

  describe "when name is too long" do
    before { @user.name = "a"*26 }
    it { should_not be_valid }

  end

  describe "when email is invalid" do
    it "should be invalid" do
      addresses = %w[user@foo,com user_at_foo.org example.user@foo.
                     foo@bar_baz.com foo@bar+baz.com]
      addresses.each do |invalid_address|
        @user.email = invalid_address
        @user.should_not be_valid
      end
    end
  end

  describe "when email is valid" do
    it "should be valid" do
      addresses = %w[user@foo.COM A_US-ER@f.b.org frst.lst@foo.jp a+b@baz.cn]
      addresses.each do |valid_address|
        @user.email = valid_address
        @user.should  be_valid
      end
    end
  end

  describe "when user email already taken" do
    before do
      user_with_dupl_email = @user.dup
      user_with_dupl_email.email = @user.email.upcase
      user_with_dupl_email.save
    end
      it { should_not be_valid }
  end

  describe "when password is blank" do
    before { @user.password = @user.password_confirmation = " " }
    it { should_not be_valid }
  end

  describe "when password is too short" do
    before { @user.password = @user.password_confirmation = "a"*5 }
    it { should be_invalid } 

  end

  describe "password and its confirmation don't match" do
    before { @user.password_confirmation = "mismatch" }
    it { should_not be_valid }
  end

  describe "when password_confirmation is nil" do
    before { @user.password_confirmation = nil }
    it { should_not be_valid }
  end


  describe "return value of authenticate method" do
    before { @user.save }
    let(:found_user) { User.where(email: @user.email).first }

      describe "with valid password" do
        it { should == found_user.authenticate(@user.password) }
      end

      describe "with invalid password" do
        let(:user_for_invalid_pass) { found_user.authenticate("invalid") }
        it { should_not = user_for_invalid_pass }
        specify { user_for_invalid_pass.should be_false }
      end
  end
















end
